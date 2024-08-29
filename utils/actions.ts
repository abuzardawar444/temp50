// "use server";

// import {
//   createReviewSchema,
//   imageSchema,
//   profileSchema,
//   propertySchema,
//   validateWithZodSchema,
// } from "./schemas";
// import db from "./db";
// import { auth, clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { uploadImage } from "./supabase";
// import { calculateTotals } from "./calculateTotals";
// import { formatDate } from "./format";

// const getAuthUser = async () => {
//   // Purpose of this function is to extract auth user from clerk
//   // Get auth user from clerk
//   const user = await currentUser();

//   // If there's no logged in user and user tried to access this route show meesage to have user loggin
//   if (!user) throw new Error("Please log in to create a profile");

//   // If user logged in but not create a profile yet bring him/her to route '/profile/create'

//   if (!user.privateMetadata.hasProfile) redirect("/profile/create");

//   return user;
// };

// const getAdminUser = async () => {
//   const user = await getAuthUser();
//   if (user.id !== process.env.ADMIN_USER_ID) redirect("/");
//   return user;
// };

// const renderError = (error: unknown): { message: string } => {
//   // If user tried to access route '/profile/create without logging in return message thrown away by new Error in try block'
//   // Somehow if error isn't caused by not login return another message
//   return {
//     message: error instanceof Error ? error.message : "An error occured",
//   };
// };

// export async function createProfileAction(
//   prevState: any,
//   formData: FormData
// ): Promise<{ message: string }> {
//   try {
//     // Access Backend API User object for the authenticated user.
//     const user = await currentUser();
//     if (!user) throw new Error("Please log in to create a profile");

//     // Extract data from form data
//     const rawData = Object.fromEntries(formData);

//     // Validate data as defined in profileSchema
//     // in the schema it conditions how input can be accepted once form is submitted
//     const validatedFields = validateWithZodSchema(profileSchema, rawData);

//     // Create profile in the database
//     await db.profile.create({
//       data: {
//         clerkId: user.id,
//         email: user.emailAddresses[0].emailAddress,
//         profileImage: user.imageUrl ?? "",
//         ...validatedFields,
//       },
//     });

//     // Update user meta data in clerk to confirm that user has created a profile
//     await clerkClient.users.updateUserMetadata(user.id, {
//       privateMetadata: {
//         hasProfile: true,
//       },
//     });
//   } catch (error) {
//     return renderError(error);
//   }
//   redirect("/");
// }

// export const fetchProfileImage = async () => {
//   // fetch user from clerk
//   const user = await currentUser();
//   if (!user) return null;

//   // user returned from clerk contains user.id
//   // use that id to match clerkId in current loggined user prisma backend
//   // and retrive unique record from profile(user backend) in this case is  profileImage that i need
//   const profile = await db.profile.findUnique({
//     where: {
//       clerkId: user.id,
//     },
//     select: {
//       profileImage: true,
//     },
//   });

//   return profile?.profileImage;
// };

// // What this function does is to allow user edit profile
// export const fetchProfile = async () => {
//   const user = await getAuthUser();

//   // It's allowable for user to have more than one account so in order to fetch profile we gotta check which account is currently logged in
//   // get profile from prisma (user database middele man) based on user.id extracted from clerk.In prisam each user account is stored uiquely by clerkId
//   // User.id is created when user created profile
//   const profile = await db.profile.findUnique({
//     where: {
//       clerkId: user.id,
//     },
//   });

//   // it's perfectly possible that user has not created profile then we can't find one due to no user.id exists in this account
//   // If so redirect user to route '/profile/create'
//   if (!profile) redirect("/profile/create");

//   return profile;
// };

// // Update data to prisma
// export const updateProfileAction = async (
//   prevState: any,
//   formData: FormData
// ): Promise<{ message: string }> => {
//   //  Get auth user
//   const user = await getAuthUser();

//   try {
//     // Extract data from form data
//     const rawData = Object.fromEntries(formData);

//     // Validate data as defined in profileSchema
//     // in the schema it conditions how input can be accepted once form is submitted
//     const validatedFields = validateWithZodSchema(profileSchema, rawData);

//     await db.profile.update({
//       where: {
//         clerkId: user.id,
//       },
//       data: {
//         ...validatedFields,
//       },
//     });
//     revalidatePath("/profile");

//     return { message: "Profile updated successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export const updateProfileImageAction = async (
//   prevState: any,
//   formData: FormData
// ): Promise<{ message: string }> => {
//   const user = getAuthUser();
//   try {
//     const image = formData.get("image") as File;
//     const validatedFields = validateWithZodSchema(imageSchema, { image });
//     const fullPath = await uploadImage(validatedFields.image);

//     await db.profile.update({
//       where: {
//         clerkId: (await user).id,
//       },
//       data: {
//         profileImage: fullPath,
//       },
//     });
//     revalidatePath("/profile");
//     return { message: "Profile image updated successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export const createPropertyAction = async (
//   prevState: any,
//   formData: FormData
// ): Promise<{ message: string }> => {
//   //  Get auth user
//   const user = await getAuthUser();
//   try {
//     // Get data from form submitted
//     const rawData = Object.fromEntries(formData);

//     const file = formData.get("image") as File;

//     // send form data to be validated
//     const validatedFields = validateWithZodSchema(propertySchema, rawData);

//     // send image to be validated
//     const validatedFile = validateWithZodSchema(imageSchema, { image: file });

//     // get uploaded image public url
//     const fullPath = await uploadImage(validatedFile.image);

//     // inject data to model Property in prisma
//     await db.property.create({
//       data: {
//         ...validatedFields,
//         image: fullPath,
//         profileId: user.id,
//       },
//     });
//   } catch (error) {
//     return renderError(error);
//   }
//   redirect("/");
// };

// export const getFlagEmoji = (countryCode: string) => {
//   const codePoints = countryCode
//     .toUpperCase()
//     .split("")
//     .map((char) => 127397 + char.charCodeAt(0));
//   return String.fromCodePoint(...codePoints);
// };

// // Fetching properties by either search or category
// export const fetchProperties = async ({
//   search = "",
//   category,
// }: {
//   search?: string;
//   category?: string;
// }) => {
//   // the reason why we set search default to be empty string is in no searching scencnario (yet) search's going to be undefined it results in properties returning undefined. So we have to give it empty string default to say hey return all properties if no search passed in
//   const properties = await db.property.findMany({
//     where: {
//       category,
//       OR: [
//         { name: { contains: search, mode: "insensitive" } },
//         { tagline: { contains: search, mode: "insensitive" } },
//       ],
//     },
//     // when we find ones matching search or category specificially select data name out of database based on what we're going to use for rendering
//     select: {
//       id: true,
//       name: true,
//       tagline: true,
//       country: true,
//       price: true,
//       image: true,
//     },
//     // Order of fetching made by decendent (desc) the newest ones are displayed first
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
//   return properties;
// };

// export const fetchFavoriteId = async ({
//   propertyId,
// }: {
//   propertyId: string;
// }) => {
//   const user = await getAuthUser();
//   const favorite = await db.favorite.findFirst({
//     where: {
//       propertyId,
//       profileId: user.id,
//     },
//     select: {
//       id: true,
//     },
//   });
//   return favorite?.id || null;
// };

// export const toggleFavoriteAction = async (prevState: {
//   propertyId: string;
//   favoriteId: string | null;
//   pathname: string;
// }) => {
//   const user = await getAuthUser();
//   const { propertyId, favoriteId, pathname } = prevState;
//   try {
//     if (favoriteId) {
//       await db.favorite.delete({
//         where: {
//           id: favoriteId,
//         },
//       });
//     } else {
//       await db.favorite.create({
//         data: {
//           propertyId,
//           profileId: user.id,
//         },
//       });
//     }
//     revalidatePath(pathname);
//     return { message: favoriteId ? "Removed from Faves" : "Added to Faves" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export const fetchFavorites = async () => {
//   const user = await getAuthUser();
//   const favorites = await db.favorite.findMany({
//     where: {
//       profileId: user.id,
//     },
//     select: {
//       property: {
//         select: {
//           id: true,
//           name: true,
//           tagline: true,
//           country: true,
//           price: true,
//           image: true,
//         },
//       },
//     },
//   });
//   return favorites.map((favorite) => favorite.property);
// };

// export const fetchPropertyDetails = (id: string) => {
//   return db.property.findUnique({
//     where: {
//       id,
//     },
//     // The include keyword is used to fetch related data from other models (relations) in addition to the main model's fields. it fetches the entire related model or relation data by default, unless you further specify what to include from the related model.
//     include: {
//       profile: true,
//       bookings: {
//         select: {
//           checkIn: true,
//           checkOut: true,
//         },
//       },
//     },
//   });
// };

// export const createReviewAction = async (
//   prevState: any,
//   formData: FormData
// ) => {
//   const user = await getAuthUser();
//   try {
//     const rawData = Object.fromEntries(formData);
//     const validatedFields = validateWithZodSchema(createReviewSchema, rawData);

//     await db.review.create({
//       data: {
//         ...validatedFields,
//         profileId: user.id,
//       },
//     });
//     revalidatePath(`/properties/${validatedFields.propertyId}`);
//     return { message: "Review submitted successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export const fetchPropertyReviews = async (propertyId: string) => {
//   // Since each single property can have several reviews we use findMany to fetch data
//   const reviews = await db.review.findMany({
//     where: {
//       propertyId,
//     },
//     select: {
//       id: true,
//       rating: true,
//       comment: true,
//       profile: {
//         select: {
//           firstName: true,
//           profileImage: true,
//         },
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
//   return reviews;
// };

// export const fetchPropertyReviewsByUser = async () => {
//   const user = await getAuthUser();
//   const reviews = await db.review.findMany({
//     where: {
//       profileId: user.id,
//     },
//     select: {
//       id: true,
//       rating: true,
//       comment: true,
//       property: {
//         select: {
//           name: true,
//           image: true,
//         },
//       },
//     },
//   });
//   return reviews;
// };

// export const deleteReviewAction = async (prevState: { reviewId: string }) => {
//   const { reviewId } = prevState;
//   const user = await getAuthUser();

//   try {
//     await db.review.delete({
//       where: {
//         id: reviewId,
//         profileId: user.id,
//       },
//     });
//     revalidatePath("/reviews");
//     return { message: "Review deleted successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export async function fetchPropertyRating(propertyId: string) {
//   const result = await db.review.groupBy({
//     by: ["propertyId"],
//     _avg: {
//       rating: true,
//     },
//     _count: {
//       rating: true,
//     },
//     where: {
//       propertyId,
//     },
//   });

//   // empty array if no reviews
//   return {
//     rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
//     count: result[0]?._count.rating ?? 0,
//   };
// }

// export const findExistingReview = async (
//   userId: string,
//   propertyId: string
// ) => {
//   return db.review.findFirst({
//     where: {
//       profileId: userId,
//       propertyId: propertyId,
//     },
//   });
// };

// export const createBookingAction = async (prevState: {
//   propertyId: string;
//   checkIn: Date;
//   checkOut: Date;
// }) => {
//   const user = await getAuthUser();
//   await db.booking.deleteMany({
//     where: {
//       profileId: user.id,
//       paymentStatus: false,
//     },
//   });
//   let bookingId: null | string = null;
//   const { propertyId, checkIn, checkOut } = prevState;

//   // extract pruce of selected property (propertyId)
//   const property = await db.property.findUnique({
//     where: { id: propertyId },
//     select: { price: true },
//   });
//   if (!property) return { message: "Property not found" };

//   // calculate orderTotal, totalNights by price extracted from database
//   const { orderTotal, totalNights } = calculateTotals({
//     checkIn,
//     checkOut,
//     price: property.price,
//   });

//   // store all fields in Booking model
//   try {
//     const booking = await db.booking.create({
//       data: {
//         checkIn,
//         checkOut,
//         orderTotal,
//         totalNights,
//         profileId: user.id,
//         propertyId,
//       },
//     });
//     bookingId = booking.id;
//   } catch (error) {
//     return renderError(error);
//   }
//   // navigate to /bookings page when booking is successfully submitted
//   redirect(`/checkout?bookingId=${bookingId}`);
// };

// export const fetchBookings = async () => {
//   const user = await getAuthUser();
//   const bookings = await db.booking.findMany({
//     where: {
//       profileId: user.id,
//       paymentStatus: true,
//     },
//     include: {
//       property: {
//         select: {
//           id: true,
//           name: true,
//           country: true,
//         },
//       },
//     },

//     orderBy: {
//       checkIn: "desc",
//     },
//   });
//   return bookings;
// };

// export const deleteBookingAction = async (prevState: { bookingId: string }) => {
//   const { bookingId } = prevState;
//   const user = await getAuthUser();
//   try {
//     const result = await db.booking.delete({
//       where: {
//         id: bookingId,
//         profileId: user.id,
//       },
//     });
//     revalidatePath("/bookings");
//     return { message: "Booking deleted successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// // Fetch rentals is allowed only for auth user
// export const fetchRentals = async () => {
//   const user = await getAuthUser();
//   // In certain user account retrieve all properties he has
//   const rentals = await db.property.findMany({
//     where: {
//       profileId: user.id,
//     },
//     select: {
//       id: true,
//       name: true,
//       price: true,
//     },
//   });

//   // With all properties extracted out
//   // I need totalNights , totalOrder based on propertyId and payment status
//   // But it's 2 execution accessing data in backend in order to perform asynchronouesely Promise.all comes in play
//   const rentalsWithBookingSums = await Promise.all(
//     rentals.map(async (rental) => {
//       const totalNightsSum = await db.booking.aggregate({
//         where: {
//           propertyId: rental.id,
//           paymentStatus: true,
//         },
//         _sum: {
//           totalNights: true,
//         },
//       });

//       const orderTotalSum = await db.booking.aggregate({
//         where: {
//           propertyId: rental.id,
//           paymentStatus: true,
//         },
//         _sum: {
//           orderTotal: true,
//         },
//       });

//       return {
//         ...rental,
//         totalNightsSum: totalNightsSum._sum.totalNights,
//         orderTotalSum: orderTotalSum._sum.orderTotal,
//       };
//     })
//   );

//   return rentalsWithBookingSums;
// };

// export async function deleteRentalAction(prevState: { propertyId: string }) {
//   const { propertyId } = prevState;
//   const user = await getAuthUser();

//   try {
//     await db.property.delete({
//       where: {
//         id: propertyId,
//         profileId: user.id,
//       },
//     });

//     revalidatePath("/rentals");
//     return { message: "Rental deleted successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// }

// export const fetchRentalDetails = async (propertyId: string) => {
//   const user = await getAuthUser();
//   return db.property.findUnique({
//     where: {
//       id: propertyId,
//       profileId: user.id,
//     },
//   });
// };

// export const updatePropertyAction = async (
//   prevState: any,
//   formData: FormData
// ): Promise<{ message: string }> => {
//   const user = await getAuthUser();
//   const propertyId = formData.get("id") as string;

//   try {
//     // get data out of form
//     const rawData = Object.fromEntries(formData);

//     // validate fields that user has input
//     const validatedFields = validateWithZodSchema(propertySchema, rawData);
//     // validatedFields now stored in {}

//     // update property in data base
//     await db.property.update({
//       where: {
//         id: propertyId,
//         profileId: user.id,
//       },
//       data: {
//         ...validatedFields,
//       },
//     });

//     // revalidate current route to reflect changed data
//     revalidatePath(`/rentals/${propertyId}/edit`);
//     return { message: "Updated Successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export const updatePropertyImageAction = async (
//   prevState: any,
//   formData: FormData
// ): Promise<{ message: string }> => {
//   const user = await getAuthUser();
//   const propertyId = formData.get("id") as string;

//   try {
//     const image = formData.get("image") as File;
//     const validatedFields = validateWithZodSchema(imageSchema, { image });
//     const fullPath = await uploadImage(validatedFields.image);

//     await db.property.update({
//       where: {
//         id: propertyId,
//         profileId: user.id,
//       },
//       data: {
//         image: fullPath,
//       },
//     });
//     revalidatePath(`/rentals/${propertyId}/edit`);
//     return { message: "Property Image Updated Successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export const fetchReservations = async () => {
//   const user = await getAuthUser();

//   const reservations = await db.booking.findMany({
//     where: {
//       paymentStatus: true,
//       property: {
//         profileId: user.id,
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//     include: {
//       property: {
//         select: {
//           id: true,
//           name: true,
//           price: true,
//           country: true,
//         },
//       },
//     },
//   });
//   return reservations;
// };

// export const fetchStats = async () => {
//   await getAdminUser();

//   const usersCount = await db.profile.count();
//   const propertiesCount = await db.property.count();
//   const bookingsCount = await db.booking.count({
//     where: {
//       paymentStatus: true,
//     },
//   });

//   return {
//     usersCount,
//     propertiesCount,
//     bookingsCount,
//   };
// };

// export const fetchChartsData = async () => {
//   await getAdminUser();
//   const date = new Date();
//   date.setMonth(date.getMonth() - 6);
//   const sixMonthsAgo = date;

//   const bookings = await db.booking.findMany({
//     where: {
//       paymentStatus: true,
//       createdAt: {
//         gte: sixMonthsAgo,
//       },
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//   });
//   const bookingsPerMonth = bookings.reduce((total, current) => {
//     const date = formatDate(current.createdAt, true);
//     const existingEntry = total.find((entry) => entry.date === date);
//     if (existingEntry) {
//       existingEntry.count += 1;
//     } else {
//       total.push({ date, count: 1 });
//     }
//     return total;
//   }, [] as Array<{ date: string; count: number }>);
//   return bookingsPerMonth;
// };

"use server";

import {
  imageSchema,
  profileSchema,
  propertySchema,
  validateWithZodSchema,
  createReviewSchema,
} from "./schemas";
import db from "./db";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage } from "./supabase";
import { calculateTotals } from "./calculateTotals";
import { formatDate } from "./format";
const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to access this route");
  }
  if (!user.privateMetadata.hasProfile) redirect("/profile/create");
  return user;
};

const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.id !== process.env.ADMIN_USER_ID) redirect("/");
  return user;
};

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "An error occurred",
  };
};

export const createProfileAction = async (
  prevState: any,
  formData: FormData
) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Please login to create a profile");

    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl ?? "",
        ...validatedFields,
      },
    });
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

export const fetchProfileImage = async () => {
  const user = await currentUser();
  if (!user) return null;

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      profileImage: true,
    },
  });

  return profile?.profileImage;
};

export const fetchProfile = async () => {
  const user = await getAuthUser();
  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });
  if (!profile) redirect("/profile/create");
  return profile;
};

export const updateProfileAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });

    revalidatePath("/profile");
    return { message: "Profile updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProfileImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: {
        profileImage: fullPath,
      },
    });
    revalidatePath("/profile");
    return { message: "Profile image updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const createPropertyAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get("image") as File;
    console.log(rawData);

    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);

    await db.property.create({
      data: {
        ...validatedFields,
        image: fullPath,
        profileId: user.id,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

export const fetchProperties = async ({
  search = "",
  category,
}: {
  search?: string;
  category?: string;
}) => {
  const properties = await db.property.findMany({
    where: {
      category,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      tagline: true,
      country: true,
      price: true,
      image: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return properties;
};

export const fetchFavoriteId = async ({
  propertyId,
}: {
  propertyId: string;
}) => {
  const user = await getAuthUser();
  const favorite = await db.favorite.findFirst({
    where: {
      propertyId,
      profileId: user.id,
    },
    select: {
      id: true,
    },
  });
  return favorite?.id || null;
};

export const toggleFavoriteAction = async (prevState: {
  propertyId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await getAuthUser();
  const { propertyId, favoriteId, pathname } = prevState;
  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favorite.create({
        data: {
          propertyId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return { message: favoriteId ? "Removed from Faves" : "Added to Faves" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favorite.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      property: {
        select: {
          id: true,
          name: true,
          tagline: true,
          country: true,
          price: true,
          image: true,
        },
      },
    },
  });
  return favorites.map((favorite) => favorite.property);
};

export const fetchPropertyDetails = (id: string) => {
  return db.property.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
      bookings: {
        select: {
          checkIn: true,
          checkOut: true,
        },
      },
    },
  });
};

export async function createReviewAction(prevState: any, formData: FormData) {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(createReviewSchema, rawData);

    await db.review.create({
      data: {
        ...validatedFields,
        profileId: user.id,
      },
    });
    revalidatePath(`/properties/${validatedFields.propertyId}`);
    return { message: "Review submitted successfully" };
  } catch (error) {
    return renderError(error);
  }
}

export async function fetchPropertyReviews(propertyId: string) {
  const reviews = await db.review.findMany({
    where: {
      propertyId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      profile: {
        select: {
          firstName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return reviews;
}

export const fetchPropertyReviewsByUser = async () => {
  const user = await getAuthUser();
  const reviews = await db.review.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
  return reviews;
};

export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();

  try {
    await db.review.delete({
      where: {
        id: reviewId,
        profileId: user.id,
      },
    });

    revalidatePath("/reviews");
    return { message: "Review deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const findExistingReview = async (
  userId: string,
  propertyId: string
) => {
  return db.review.findFirst({
    where: {
      profileId: userId,
      propertyId: propertyId,
    },
  });
};

export async function fetchPropertyRating(propertyId: string) {
  const result = await db.review.groupBy({
    by: ["propertyId"],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      propertyId,
    },
  });

  // empty array if no reviews
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0,
  };
}

export const createBookingAction = async (prevState: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) => {
  const user = await getAuthUser();
  await db.booking.deleteMany({
    where: {
      profileId: user.id,
      paymentStatus: false,
    },
  });
  let bookingId: null | string = null;

  const { propertyId, checkIn, checkOut } = prevState;
  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { price: true },
  });
  if (!property) {
    return { message: "Property not found" };
  }
  const { orderTotal, totalNights } = calculateTotals({
    checkIn,
    checkOut,
    price: property.price,
  });

  try {
    const booking = await db.booking.create({
      data: {
        checkIn,
        checkOut,
        orderTotal,
        totalNights,
        profileId: user.id,
        propertyId,
      },
    });
    bookingId = booking.id;
  } catch (error) {
    return renderError(error);
  }
  redirect(`/checkout?bookingId=${bookingId}`);
};

export const fetchBookings = async () => {
  const user = await getAuthUser();
  const bookings = await db.booking.findMany({
    where: {
      profileId: user.id,
      paymentStatus: true,
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          country: true,
        },
      },
    },

    orderBy: {
      checkIn: "desc",
    },
  });
  return bookings;
};

export async function deleteBookingAction(prevState: { bookingId: string }) {
  const { bookingId } = prevState;
  const user = await getAuthUser();

  try {
    const result = await db.booking.delete({
      where: {
        id: bookingId,
        profileId: user.id,
      },
    });

    revalidatePath("/bookings");
    return { message: "Booking deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
}

export const fetchRentals = async () => {
  const user = await getAuthUser();
  const rentals = await db.property.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  const rentalsWithBookingSums = await Promise.all(
    rentals.map(async (rental) => {
      const totalNightsSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        _sum: {
          totalNights: true,
        },
      });

      const orderTotalSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        _sum: {
          orderTotal: true,
        },
      });

      return {
        ...rental,
        totalNightsSum: totalNightsSum._sum.totalNights,
        orderTotalSum: orderTotalSum._sum.orderTotal,
      };
    })
  );

  return rentalsWithBookingSums;
};

export async function deleteRentalAction(prevState: { propertyId: string }) {
  const { propertyId } = prevState;
  const user = await getAuthUser();

  try {
    await db.property.delete({
      where: {
        id: propertyId,
        profileId: user.id,
      },
    });

    revalidatePath("/rentals");
    return { message: "Rental deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
}

export const fetchRentalDetails = async (propertyId: string) => {
  const user = await getAuthUser();

  return db.property.findUnique({
    where: {
      id: propertyId,
      profileId: user.id,
    },
  });
};

export const updatePropertyAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get("id") as string;

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        ...validatedFields,
      },
    });

    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: "Update Successful" };
  } catch (error) {
    return renderError(error);
  }
};

export const updatePropertyImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get("id") as string;

  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);

    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        image: fullPath,
      },
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: "Property Image Updated Successful" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchReservations = async () => {
  const user = await getAuthUser();

  const reservations = await db.booking.findMany({
    where: {
      paymentStatus: true,
      property: {
        profileId: user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          price: true,
          country: true,
        },
      },
    },
  });
  return reservations;
};

export const fetchStats = async () => {
  await getAdminUser();

  const usersCount = await db.profile.count();
  const propertiesCount = await db.property.count();
  const bookingsCount = await db.booking.count({
    where: {
      paymentStatus: true,
    },
  });

  return {
    usersCount,
    propertiesCount,
    bookingsCount,
  };
};

export const fetchChartsData = async () => {
  await getAdminUser();
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  const sixMonthsAgo = date;

  const bookings = await db.booking.findMany({
    where: {
      paymentStatus: true,
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const bookingsPerMonth = bookings.reduce((total, current) => {
    const date = formatDate(current.createdAt, true);
    const existingEntry = total.find((entry) => entry.date === date);
    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      total.push({ date, count: 1 });
    }
    return total;
  }, [] as Array<{ date: string; count: number }>);
  return bookingsPerMonth;
};

export const fetchReservationStats = async () => {
  const user = await getAuthUser();

  const properties = await db.property.count({
    where: {
      profileId: user.id,
    },
  });

  const totals = await db.booking.aggregate({
    _sum: {
      orderTotal: true,
      totalNights: true,
    },
    where: {
      property: {
        profileId: user.id,
      },
    },
  });

  return {
    properties,
    nights: totals._sum.totalNights || 0,
    amount: totals._sum.orderTotal || 0,
  };
};
