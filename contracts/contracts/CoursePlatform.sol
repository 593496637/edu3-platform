// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CoursePlatform is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // YD代币合约地址
    IERC20 public ydToken;

    // 平台手续费率 (基点，10000 = 100%)
    uint256 public platformFeeRate = 250; // 2.5%

    // 课程结构
    struct Course {
        uint256 id;
        address author;
        uint256 price; // 以YD代币为单位
        bool isActive;
        uint256 createdAt;
        uint256 totalSales; // 总销售额
        uint256 studentCount; // 学生数量
    }

    // 存储所有课程
    mapping(uint256 => Course) public courses;

    // 课程购买记录：courseId => user => bool
    mapping(uint256 => mapping(address => bool)) public hasPurchased;

    // 作者的课程列表：author => courseId[]
    mapping(address => uint256[]) public authorCourses;

    // 用户购买的课程列表：user => courseId[]
    mapping(address => uint256[]) public userPurchasedCourses;

    // 课程计数器
    uint256 public nextCourseId = 1;

    // 作者权限管理
    mapping(address => bool) public isInstructor;
    mapping(address => bool) public instructorApplications;

    // 事件
    event CourseCreated(
        uint256 indexed courseId,
        address indexed author,
        uint256 price
    );
    event CoursePurchased(
        uint256 indexed courseId,
        address indexed student,
        address indexed author,
        uint256 price
    );
    event InstructorApplicationSubmitted(address indexed applicant);
    event InstructorApproved(address indexed instructor);
    event PlatformFeeUpdated(uint256 newFeeRate);

    constructor(address _ydTokenAddress) Ownable(msg.sender) {
        ydToken = IERC20(_ydTokenAddress);
    }

    /**
     * @dev 申请成为讲师
     */
    function applyToBeInstructor() external {
        require(!isInstructor[msg.sender], "Already an instructor");
        require(
            !instructorApplications[msg.sender],
            "Application already submitted"
        );

        instructorApplications[msg.sender] = true;
        emit InstructorApplicationSubmitted(msg.sender);
    }

    /**
     * @dev 批准讲师申请（仅owner）
     */
    function approveInstructor(address instructor) external onlyOwner {
        require(instructorApplications[instructor], "No application found");

        isInstructor[instructor] = true;
        instructorApplications[instructor] = false; // 清除申请记录

        emit InstructorApproved(instructor);
    }

    /**
     * @dev 创建课程（仅讲师）
     */
    function createCourse(uint256 price) external returns (uint256) {
        require(
            isInstructor[msg.sender],
            "Only instructors can create courses"
        );
        require(price > 0, "Price must be greater than 0");

        uint256 courseId = nextCourseId++;

        courses[courseId] = Course({
            id: courseId,
            author: msg.sender,
            price: price,
            isActive: true,
            createdAt: block.timestamp,
            totalSales: 0,
            studentCount: 0
        });

        authorCourses[msg.sender].push(courseId);

        // 作者自动拥有自己的课程
        hasPurchased[courseId][msg.sender] = true;
        userPurchasedCourses[msg.sender].push(courseId);

        emit CourseCreated(courseId, msg.sender, price);
        return courseId;
    }

    /**
     * @dev 购买课程
     */
    function buyCourse(uint256 courseId) external nonReentrant {
        Course storage course = courses[courseId];
        require(course.author != address(0), "Course does not exist");
        require(course.isActive, "Course is not active");
        require(
            !hasPurchased[courseId][msg.sender],
            "Already purchased this course"
        );
        require(
            ydToken.balanceOf(msg.sender) >= course.price,
            "Insufficient YD token balance"
        );

        // 计算平台手续费
        uint256 platformFee = (course.price * platformFeeRate) / 10000;
        uint256 authorAmount = course.price - platformFee;

        // 转账YD代币：学生 -> 作者
        ydToken.safeTransferFrom(msg.sender, course.author, authorAmount);

        // 转账YD代币：学生 -> 平台（手续费）
        if (platformFee > 0) {
            ydToken.safeTransferFrom(msg.sender, owner(), platformFee);
        }

        // 更新购买记录
        hasPurchased[courseId][msg.sender] = true;
        userPurchasedCourses[msg.sender].push(courseId);

        // 更新课程统计
        course.totalSales += course.price;
        course.studentCount++;

        emit CoursePurchased(courseId, msg.sender, course.author, course.price);
    }

    /**
     * @dev 检查用户是否购买了某个课程
     */
    function hasUserPurchasedCourse(
        uint256 courseId,
        address user
    ) external view returns (bool) {
        return hasPurchased[courseId][user];
    }

    /**
     * @dev 获取用户购买的所有课程ID
     */
    function getUserPurchasedCourses(
        address user
    ) external view returns (uint256[] memory) {
        return userPurchasedCourses[user];
    }

    /**
     * @dev 获取作者的所有课程ID
     */
    function getAuthorCourses(
        address author
    ) external view returns (uint256[] memory) {
        return authorCourses[author];
    }

    /**
     * @dev 获取课程信息
     */
    function getCourse(uint256 courseId) external view returns (Course memory) {
        return courses[courseId];
    }

    /**
     * @dev 设置平台手续费率（仅owner）
     */
    function setPlatformFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 1000, "Fee rate cannot exceed 10%"); // 最大10%
        platformFeeRate = newFeeRate;
        emit PlatformFeeUpdated(newFeeRate);
    }

    /**
     * @dev 暂停/恢复课程（仅作者或owner）
     */
    function toggleCourseStatus(uint256 courseId) external {
        Course storage course = courses[courseId];
        require(
            course.author == msg.sender || msg.sender == owner(),
            "Not authorized"
        );

        course.isActive = !course.isActive;
    }

    /**
     * @dev 获取当前课程总数
     */
    function getTotalCourses() external view returns (uint256) {
        return nextCourseId - 1;
    }
}
