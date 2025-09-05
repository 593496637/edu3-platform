import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  BookOpen,
  CheckCircle,
  Clock,
  List,
  Download,
  MessageCircle,
} from "lucide-react";
import { CONTRACTS, COURSE_PLATFORM_ABI } from "../lib/contracts";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  resources: Array<{
    title: string;
    url: string;
    type: 'pdf' | 'code' | 'link';
  }>;
  completed: boolean;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  lessons: Lesson[];
}

export default function CourseLearnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // 检查用户是否已购买课程
  const { data: hasPurchased } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: "hasPurchasedCourse",
    args: address && id ? [BigInt(id), address] : undefined,
    query: {
      enabled: !!address && !!id,
    },
  });

  // 模拟课程数据
  const course: Course = {
    id: Number(id),
    title: `Web3开发基础课程 ${id}`,
    instructor: "0x1234567890123456789012345678901234567890",
    lessons: [
      {
        id: 1,
        title: "Web3概述和区块链基础",
        duration: "45分钟",
        videoUrl: "/api/placeholder/video/1",
        description: "本课程将带您了解Web3的基本概念，区块链技术的工作原理，以及它如何改变我们的数字世界。我们将探讨去中心化的优势，智能合约的基础概念，以及Web3生态系统中的主要参与者。",
        resources: [
          { title: "区块链基础知识.pdf", url: "#", type: "pdf" },
          { title: "Web3术语表", url: "#", type: "link" },
          { title: "示例代码", url: "#", type: "code" },
        ],
        completed: false,
      },
      {
        id: 2,
        title: "以太坊网络和智能合约介绍",
        duration: "60分钟",
        videoUrl: "/api/placeholder/video/2",
        description: "深入了解以太坊网络的架构，Gas费用机制，以及智能合约的基本原理。学习如何与以太坊网络交互，理解交易的生命周期。",
        resources: [
          { title: "以太坊白皮书.pdf", url: "#", type: "pdf" },
          { title: "Remix IDE使用指南", url: "#", type: "link" },
        ],
        completed: false,
      },
      {
        id: 3,
        title: "Solidity语言基础",
        duration: "90分钟",
        videoUrl: "/api/placeholder/video/3",
        description: "学习Solidity编程语言的语法，数据类型，函数，修饰符等核心概念。通过实际例子理解智能合约的编写方式。",
        resources: [
          { title: "Solidity文档", url: "#", type: "link" },
          { title: "基础合约示例.sol", url: "#", type: "code" },
        ],
        completed: false,
      },
      {
        id: 4,
        title: "智能合约开发实践",
        duration: "120分钟",
        videoUrl: "/api/placeholder/video/4",
        description: "通过构建实际的智能合约项目，学习开发流程，测试方法，以及部署最佳实践。",
        resources: [
          { title: "项目源码", url: "#", type: "code" },
          { title: "测试用例", url: "#", type: "code" },
        ],
        completed: false,
      },
      {
        id: 5,
        title: "前端DApp开发",
        duration: "150分钟",
        videoUrl: "/api/placeholder/video/5",
        description: "学习如何使用Web3.js和ethers.js构建前端应用，连接钱包，与智能合约交互。",
        resources: [
          { title: "React DApp模板", url: "#", type: "code" },
          { title: "Web3.js文档", url: "#", type: "link" },
        ],
        completed: false,
      },
      {
        id: 6,
        title: "Web3项目部署",
        duration: "90分钟",
        videoUrl: "/api/placeholder/video/6",
        description: "学习如何将智能合约部署到测试网和主网，以及前端应用的部署方法。",
        resources: [
          { title: "部署脚本", url: "#", type: "code" },
          { title: "Vercel部署指南", url: "#", type: "link" },
        ],
        completed: false,
      },
    ],
  };

  const currentLesson = course.lessons[currentLessonIndex];
  const completedLessons = course.lessons.filter(lesson => lesson.completed).length;
  const progress = (completedLessons / course.lessons.length) * 100;

  // 如果用户未购买课程，重定向到课程详情页
  useEffect(() => {
    if (isConnected && hasPurchased === false) {
      navigate(`/course/${id}`);
    }
  }, [isConnected, hasPurchased, navigate, id]);

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handleMarkCompleted = () => {
    // 在实际应用中，这里应该调用API保存进度
    course.lessons[currentLessonIndex].completed = true;
    // 自动跳转到下一课
    if (currentLessonIndex < course.lessons.length - 1) {
      setTimeout(() => handleNextLesson(), 1000);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <BookOpen className="h-4 w-4" />;
      case 'code':
        return <Download className="h-4 w-4" />;
      case 'link':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">请先连接钱包</h3>
          <p className="text-gray-500 mb-4">连接钱包后继续学习</p>
          <Link
            to={`/course/${id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            返回课程页面
          </Link>
        </div>
      </div>
    );
  }

  if (hasPurchased === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">课程访问受限</h3>
          <p className="text-gray-500 mb-4">您需要购买此课程才能观看</p>
          <Link
            to={`/course/${id}`}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            购买课程
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 顶部导航栏 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-300 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              退出课程
            </button>
            <div className="text-white">
              <h1 className="font-medium">{course.title}</h1>
              <p className="text-sm text-gray-400">
                第 {currentLessonIndex + 1} 课 / 共 {course.lessons.length} 课
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 进度条 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">进度:</span>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
            </div>

            {/* 切换侧边栏按钮 */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* 主要内容区域 */}
        <div className={`flex-1 ${showSidebar ? '' : 'mr-0'}`}>
          <div className="h-full flex flex-col">
            {/* 视频播放器 */}
            <div className="flex-1 bg-black flex items-center justify-center">
              <div className="aspect-video w-full max-w-4xl bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="mx-auto h-16 w-16 text-white mb-4" />
                  <p className="text-white">视频播放器区域</p>
                  <p className="text-gray-400 text-sm mt-2">{currentLesson.title}</p>
                </div>
              </div>
            </div>

            {/* 视频控制栏 */}
            <div className="bg-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePrevLesson}
                    disabled={currentLessonIndex === 0}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    onClick={handleNextLesson}
                    disabled={currentLessonIndex === course.lessons.length - 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>

                  <div className="text-white">
                    <span className="text-sm">{currentLesson.duration}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {!currentLesson.completed && (
                    <button
                      onClick={handleMarkCompleted}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>标记完成</span>
                    </button>
                  )}
                  
                  {currentLesson.completed && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">已完成</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        {showSidebar && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* 课程信息 */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-2">{currentLesson.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {currentLesson.duration}
                </div>
              </div>
              <p className="text-sm text-gray-300">{currentLesson.description}</p>
            </div>

            {/* 课程资源 */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-medium text-white mb-3">课程资源</h3>
              <div className="space-y-2">
                {currentLesson.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    className="flex items-center space-x-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                  >
                    {getResourceIcon(resource.type)}
                    <span className="text-sm">{resource.title}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* 课程列表 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-medium text-white mb-3">课程列表</h3>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentLessonIndex === index
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                            lesson.completed
                              ? 'bg-green-600 text-white'
                              : currentLessonIndex === index
                              ? 'bg-white text-blue-600'
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {lesson.completed ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <p className="text-xs text-gray-400">{lesson.duration}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
