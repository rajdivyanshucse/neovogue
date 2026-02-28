// import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";

// const HelpSupport = () => {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     message: ""
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const { error } = await supabase
//       .from("support_requests")
//       .insert([form]);

//     if (error) {
//       alert("Error submitting request");
//       console.error(error);
//     } else {
//       alert("Support request submitted successfully!");
//       setForm({ name: "", email: "", message: "" });
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       {/* same input fields */}
//     </form>
//   );
// };

// export default HelpSupport;