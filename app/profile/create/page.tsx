import SubmitButton from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import { createProfileAction } from "@/utils/actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const CreateProfilePage = async () => {
  // In order to navigate to homepage ('/') we need to check if there is authenticated user
  const user = await currentUser();
  if (user?.privateMetadata?.hasProfile) redirect("/");
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">new user</h1>
      <div className="border p-8 rounded-md">
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <FormContainer action={createProfileAction}>
            <FormInput type="text" name="firstName" label="First Name" />
            <FormInput type="text" name="lastName" label="Last Name" />
            <FormInput type="text" name="username" label="userName" />
            <SubmitButton text="Create Profile" className="mt-8" />
          </FormContainer>
        </div>
      </div>
    </section>
  );
};

export default CreateProfilePage;
