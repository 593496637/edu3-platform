import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { CourseCreated } from "../generated/schema"
import { CourseCreated as CourseCreatedEvent } from "../generated/CoursePlatform/CoursePlatform"
import { handleCourseCreated } from "../src/course-platform"
import { createCourseCreatedEvent } from "./course-platform-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let courseId = BigInt.fromI32(234)
    let author = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let price = BigInt.fromI32(234)
    let newCourseCreatedEvent = createCourseCreatedEvent(
      courseId,
      author,
      price
    )
    handleCourseCreated(newCourseCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("CourseCreated created and stored", () => {
    assert.entityCount("CourseCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CourseCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "courseId",
      "234"
    )
    assert.fieldEquals(
      "CourseCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "author",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CourseCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
