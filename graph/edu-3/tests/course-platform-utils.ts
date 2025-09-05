import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CourseCreated,
  CoursePurchased,
  InstructorApplicationSubmitted,
  InstructorApproved,
  OwnershipTransferred,
  PlatformFeeUpdated
} from "../generated/CoursePlatform/CoursePlatform"

export function createCourseCreatedEvent(
  courseId: BigInt,
  author: Address,
  price: BigInt
): CourseCreated {
  let courseCreatedEvent = changetype<CourseCreated>(newMockEvent())

  courseCreatedEvent.parameters = new Array()

  courseCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "courseId",
      ethereum.Value.fromUnsignedBigInt(courseId)
    )
  )
  courseCreatedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  courseCreatedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return courseCreatedEvent
}

export function createCoursePurchasedEvent(
  courseId: BigInt,
  student: Address,
  author: Address,
  price: BigInt
): CoursePurchased {
  let coursePurchasedEvent = changetype<CoursePurchased>(newMockEvent())

  coursePurchasedEvent.parameters = new Array()

  coursePurchasedEvent.parameters.push(
    new ethereum.EventParam(
      "courseId",
      ethereum.Value.fromUnsignedBigInt(courseId)
    )
  )
  coursePurchasedEvent.parameters.push(
    new ethereum.EventParam("student", ethereum.Value.fromAddress(student))
  )
  coursePurchasedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  coursePurchasedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return coursePurchasedEvent
}

export function createInstructorApplicationSubmittedEvent(
  applicant: Address
): InstructorApplicationSubmitted {
  let instructorApplicationSubmittedEvent =
    changetype<InstructorApplicationSubmitted>(newMockEvent())

  instructorApplicationSubmittedEvent.parameters = new Array()

  instructorApplicationSubmittedEvent.parameters.push(
    new ethereum.EventParam("applicant", ethereum.Value.fromAddress(applicant))
  )

  return instructorApplicationSubmittedEvent
}

export function createInstructorApprovedEvent(
  instructor: Address
): InstructorApproved {
  let instructorApprovedEvent = changetype<InstructorApproved>(newMockEvent())

  instructorApprovedEvent.parameters = new Array()

  instructorApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "instructor",
      ethereum.Value.fromAddress(instructor)
    )
  )

  return instructorApprovedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPlatformFeeUpdatedEvent(
  newFeeRate: BigInt
): PlatformFeeUpdated {
  let platformFeeUpdatedEvent = changetype<PlatformFeeUpdated>(newMockEvent())

  platformFeeUpdatedEvent.parameters = new Array()

  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newFeeRate",
      ethereum.Value.fromUnsignedBigInt(newFeeRate)
    )
  )

  return platformFeeUpdatedEvent
}
