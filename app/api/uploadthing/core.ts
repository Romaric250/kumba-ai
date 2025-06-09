import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    "application/pdf": { maxFileSize: "10MB" },
    "image/jpeg": { maxFileSize: "10MB" },
    "image/jpg": { maxFileSize: "10MB" },
    "image/png": { maxFileSize: "10MB" },
    "image/gif": { maxFileSize: "10MB" },
    "image/webp": { maxFileSize: "10MB" },
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
