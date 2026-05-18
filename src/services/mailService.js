import Gateway from "../gateway/gateway";

const readEmail = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return Gateway.post("/mail/read_email", formData);
};

export default {
  readEmail,
};
