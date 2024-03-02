import { IoMoon } from "react-icons/io5";

export default function MoonIcon(props: any) {
  return <IoMoon 
    {...props} 
    style={{ 
      display: "inline-block",
      verticalAlign: "middle",
      ...props.style
    }}
    size={props.size || 24}
  />;
}