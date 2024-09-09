import { colors } from "theme/theme";
import Card from "./CommonCard";

const Widget = ({ icon, title, subtitle, color = `${colors.White}` }) => {
  return (
    <Card extra="!flex-row flex-grow items-center rounded-[20px]">
      <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
        <div
          className="rounded-full bg-lightPrimary p-3"
          style={{ background: colors.Orange }}
        >
          <span
            className="flex items-center dark:text-white"
            style={{
              color: `${color}`,
              width: "1.75rem",
              textAlign: "center",
              fontSize: "20px",
              marginLeft:'5px'
            }}
          >
            {icon}
          </span>
        </div>
      </div>

      <div className="h-50 ml-4 flex w-auto flex-col justify-center">
        <p
          className="font-dm text-sm font-medium text-gray-600"
          style={{ paddingTop: "10px", marginLeft: "-10px" }}
        >
          {title}
        </p>
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {subtitle}
        </h4>
      </div>
    </Card>
  );
};

export default Widget;
