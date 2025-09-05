import {
  CourseCreated as CourseCreatedEvent,
  CoursePurchased as CoursePurchasedEvent,
  InstructorApplicationSubmitted as InstructorApplicationSubmittedEvent,
  InstructorApproved as InstructorApprovedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PlatformFeeUpdated as PlatformFeeUpdatedEvent
} from "../generated/CoursePlatform/CoursePlatform"
import {
  CourseCreated,
  CoursePurchased,
  InstructorApplicationSubmitted,
  InstructorApproved,
  OwnershipTransferred,
  PlatformFeeUpdated
} from "../generated/schema"

export function handleCourseCreated(event: CourseCreatedEvent): void {
  let entity = new CourseCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.courseId = event.params.courseId
  entity.author = event.params.author
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCoursePurchased(event: CoursePurchasedEvent): void {
  let entity = new CoursePurchased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.courseId = event.params.courseId
  entity.student = event.params.student
  entity.author = event.params.author
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInstructorApplicationSubmitted(
  event: InstructorApplicationSubmittedEvent
): void {
  let entity = new InstructorApplicationSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.applicant = event.params.applicant

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInstructorApproved(event: InstructorApprovedEvent): void {
  let entity = new InstructorApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.instructor = event.params.instructor

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let entity = new PlatformFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newFeeRate = event.params.newFeeRate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
