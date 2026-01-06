import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCropDetailsByCropId } from "@/api/authApi";
import { baseApi } from "../../../api";

export default function BlogPost() {
  const { id } = useParams(); // route is /blog/:id
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!id) return;
    setStatus("loading");

    fetchCropDetailsByCropId(id)
      .then((res) => {
        if (res?.success && res.data) {
          setData(res.data);
          setStatus("done");
        } else {
          setStatus("error");
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, [id]);

  const renderText = (val, title) =>
    Array.isArray(val) ? (
      <ul className="list-disc ms-6">
        {val.map((s, i) => (
          <li
            key={i}
            title={title}>
            {s}
          </li>
        ))}
      </ul>
    ) : (
      <p title={title}>{val || "তথ্য নেই"}</p>
    );

  if (status !== "done") {
    return status === "error" ? (
      <div className="p-6 text-center">
        <h2
          className="text-xl mb-2"
          style={{ color: "white" }}>
          ডেটা পাওয়া যায়নি
        </h2>
        <p
          className="text-gray-600"
          style={{ color: "white" }}>
          অনুগ্রহ করে লিংকটি যাচাই করুন বা অন্যটি চেষ্টা করুন।
        </p>
      </div>
    ) : (
      <div
        className="p-4"
        style={{ color: "white" }}>
        লোড হচ্ছে…
      </div>
    );
  }

  // ✅ Single crop detail API structure
  const {
    cropTitle,
    cropImage,
    category,
    rogLokkho: symptoms,
    koroniyo: actions = [],
  } = data;

  return (
    <div className="singlecropdetailsnew">
      <div className="cropnewimg">
        <div className="crop-details-boxsizenew">
          <div className="crop-details-image">
            <img
              src={`${baseApi}${cropImage}`}
              alt={cropTitle || "crop image"}
            />
          </div>
        </div>
        <div className="crop-details-tablesize">
          <div className="crop-details-imgtitle">
            <span>{category?.category}</span>
            <h1>{cropTitle}</h1>
          </div>
        </div>
      </div>

      <div className="crop-details-textareanew">
        <div className="crop-details-h3">
          <>
            <h3>রোগের লক্ষণঃ</h3>
            {renderText(symptoms, "রোগের লক্ষণ")}
          </>
          <br />
          <>
            <h3>করনীয়ঃ</h3>
            {renderText(actions, "করনীয়")}
          </>
        </div>
      </div>
    </div>
  );
}
