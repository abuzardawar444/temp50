import FormContainer from "@/components/form/FormContainer";
import {
  updateProfileAction,
  fetchProfile,
  updateProfileImageAction,
} from "@/utils/actions";
import FormInput from "@/components/form/FormInput";
import SubmitButton from "@/components/form/Buttons";
import ImageInputContainer from "@/components/form/ImageInputContainer";

const ProfilePage = async () => {
  const profile = await fetchProfile();

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">user profile</h1>
      <div className="border p-8 rounded-md">
        <ImageInputContainer
          action={updateProfileImageAction}
          image={profile.profileImage}
          name={profile.username}
          text="Update Profile Image"
        />
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <FormContainer action={updateProfileAction}>
            <FormInput
              type="text"
              name="firstName"
              label="First Name"
              defaultValue={profile.firstName}
            />
            <FormInput
              type="text"
              name="lastName"
              label="Last Name"
              defaultValue={profile.lastName}
            />
            <FormInput
              type="text"
              name="username"
              label="userName"
              defaultValue={profile.username}
            />
            <SubmitButton text="update profile" className="mt-8" />
          </FormContainer>
        </div>
      </div>
    </section>
  );
};
export default ProfilePage;
