import React from "react";
import { useParams } from "react-router-dom";
import { useConvertedOptions } from "utility/ConvertOptions";

const OptionData = () => {
  const { hotelName } = useParams();
  const { OPTIONS, error } = useConvertedOptions(hotelName);
console.log("OPTIONSData", OPTIONS)
  return OPTIONS
};

export default OptionData;
