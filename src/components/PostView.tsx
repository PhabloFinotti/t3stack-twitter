import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div
      key={post.id}
      className="flex gap-3 border-b border-slate-400 p-4"
    >
      <Link href={`/@${author.username}`}>
        <Image
          src={author.profileImageUrl}
          alt="Profile Image"
          height={56}
          width={56}
          className="h-14 w-14 rounded-full transition hover:opacity-80"
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <span className="text-slate-500">·</span>
          <Link href={`/post/${post.id}`}>
            <span className="text-xs text-slate-500">
              {dayjs(post.createdAt).fromNow()}
            </span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};
