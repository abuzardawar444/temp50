import EmptyList from "@/components/home/EmptyList";
import {
  deleteReviewAction,
  fetchPropertyReviewsByUser,
} from "@/utils/actions";
import ReviewCard from "@/components/reviews/ReviewCard";
import Title from "@/components/properties/Title";
import FormContainer from "@/components/form/FormContainer";
import { IconButton } from "@/components/form/Buttons";
async function ReviewsPage() {
  const reviews = await fetchPropertyReviewsByUser();
  if (reviews.length === 0) return <EmptyList />;

  return (
    <>
      <Title text="Your Reviews" />
      <section className="grid md:grid-cols-2 gap-8 mt-4 ">
        {reviews.map((review) => {
          const { comment, rating } = review;
          const { name, image } = review.property;
          const reviewInfo = {
            comment,
            rating,
            name,
            image,
          };
          return (
            <ReviewCard key={review.id} reviewInfo={reviewInfo}>
              <DeleteReview reviewId={review.id} />
            </ReviewCard>
          );
        })}
      </section>
    </>
  );
}

const DeleteReview = ({ reviewId }: { reviewId: string }) => {
  const deleteReview = deleteReviewAction.bind(null, { reviewId });
  return (
    <FormContainer action={deleteReview}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
};

export default ReviewsPage;

// The line const deleteReview = deleteReviewAction.bind(null, { reviewId }); uses the .bind() method to create a new function (deleteReview) with the this value (context) set to null and pre-defines the reviewId as the first argument to the deleteReviewAction function.

// Here’s how it works:

// Binding Arguments:

// deleteReviewAction.bind(null, { reviewId }) creates a new function (deleteReview) that, when called, will invoke deleteReviewAction with { reviewId } as its first argument.
// Executing on Button Click:

// The deleteReview function is passed to the FormContainer component as the action to be performed when the form is submitted (usually by clicking a button).
// When the button inside FormContainer is clicked, the form submission triggers the deleteReview function.
// In summary, .bind() allows you to set specific arguments for the function ahead of time. When the button is clicked, the pre-bound reviewId is passed into deleteReviewAction, triggering the deletion process.

// This approach is useful because it keeps your event handler simple and doesn't require passing arguments directly in the JSX, which can be a cleaner and more reusable pattern.
