import ProductDetails from "../components/ProductDetails.jsx";

export default function ProductDetailsPage() {
  return (
    <>
      <ProductDetails
        // image: omit to use demo placeholder (or pass a real URL)
        // image="https://example.com/your-image.jpg"
        category="কীটনাশক"
        name="একামাইট ১.৮ ই সি"
        material="এবামেকটিন ১.৮%"
        benefitTitle="ব্যবহারের সুবিধা -:"
        benefitText="চা এবং সবজির মাকড় দমনে নির্ভরযোগ্য সমাধান।"
        longDescription={`স্পর্শ ক্রিয়া সম্পন্ন কীটনাশক বলে সরাসরি শরীরের সংস্পর্শে আসা মাত্র পোকা মারা যায়।
পাকস্থলীয় ক্রিয়া সম্পন্ন কীটনাশক তাই স্প্রে করা পাতা, ডগা ইত্যাদি থেকে রস খাবার সাথে সাথে পোকা মারা যায়।
ইহা যেহেতু একটি ট্রান্সলেমিনার গুণসম্পন্ন মাকড়নাশক তাই পাতার উপর`}
        applications={[
          {
            crop: "পাট, শসা, পটল, তরমুজ",
            pest: "লাল মাকড়",
            dose: "প্রতি ১০ লিটার পানিতে ৫ শতাংশ জমির জন্য ২০ মি লি / একরে ৪০০ মি লি",
            method:
              "ফসলের বাড়ন্ত সময়ে জমিতে ক্ষুদ্রপোকা দেখা গেলে ১৫ দিন অন্তর অন্তর স্প্রে করতে হবে ।",
          },
        ]}
      />
    </>
  );
}
