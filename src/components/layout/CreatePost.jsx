/* eslint-disable no-unused-vars */
import "@/assets/styles/createPost.css";
import ImageIcon from "@/assets/IconComponents/Image.jsx";
import VideoIcon from "@/assets/IconComponents/Video.jsx";
import { baseApi } from "../../api";

function CreatePost({
  user,
  profile,
  onTextClick,
  onPhotoVideoClick,
  onFellingClick,
}) {
  return (
    <div className="createPost">
      <section className="Text-Post flex FY-center MB-1rem">
        <div
          className="createPostProfile"
          role="button"
          tabIndex={0}
          onClick={onTextClick}
          onKeyDown={(event) => {
            if (!onTextClick) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onTextClick();
            }
          }}>
          <img
            src={
              profile
                ? profile.startsWith("http")
                  ? profile
                  : `${baseApi}${profile}`
                : "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png"
            }
            alt="user profile"
          />
        </div>
        <div
          className="textPost"
          onClick={onTextClick}>
          <span>পোস্ট করুন..</span>
        </div>
      </section>

      <section className="flex FY-center MB-1rem">
        <div
          className="flex F-center FY-center mediaPostOptions mediaPostOptions--photo"
          role="button"
          tabIndex={0}
          onClick={() => onPhotoVideoClick?.("photo")}
          onKeyDown={(event) => {
            if (!onPhotoVideoClick) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onPhotoVideoClick("photo");
            }
          }}>
          <ImageIcon stroke="#4ade80" />
        </div>
        <div
          className="flex F-center FY-center mediaPostOptions mediaPostOptions--photo"
          role="button"
          tabIndex={0}
          onClick={() => onPhotoVideoClick?.("video")}
          onKeyDown={(event) => {
            if (!onPhotoVideoClick) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onPhotoVideoClick("video");
            }
          }}>
          <VideoIcon stroke="red" />
        </div>
      </section>
    </div>
  );
}

export default CreatePost;
