import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/Layout";
import { LoadingPage } from "~/components/Loading";
import { PostView } from "~/components/PostView";
import Link from "next/link";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted yet.</div>;

  return (
    <>
      {data.map((fullPost) => (
        <PostView
          {...fullPost}
          key={fullPost.post.id}
        />
      ))}
    </>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUserName.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}&apos;s Profile</title>
        <meta
          name="description"
          content="Generated by create-t3-app"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-800">
          <Link
            href={"/"}
            className="absolute left-2 top-2 block h-8 w-8 rounded-full bg-white bg-opacity-10 fill-white p-2 transition-colors hover:bg-opacity-30"
            title="Back to Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z" />
            </svg>
          </Link>
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s Profile Picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 ml-4 translate-y-[50%] rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="mt-16 border-b border-slate-400 p-4 text-2xl font-bold">
          @{data.username ?? ""}
        </div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

import { generateSSGHelper } from "~/server/helpers/ssgHelper";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUserName.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
