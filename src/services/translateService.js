import Gateway from "../gateway/gateway";

/** POST translate/to_arabic — { value } -> { value, translated_value } */
const translateToArabic = (value) => Gateway.post("translate/to_arabic", { value });

export default {
  translateToArabic,
};
