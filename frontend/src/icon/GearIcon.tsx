import { FaGear } from "react-icons/fa6";

export default function GearIcon(props: any) {
  return <FaGear 
    {...props} 
    style={{ 
      display: "inline-block",
      verticalAlign: "middle",
      ...props.style
    }}
    size={props.size || 24}
  />;
}