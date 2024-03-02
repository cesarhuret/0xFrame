import { IoSunny } from "react-icons/io5";

export default function SunIcon(props: any) {
  return <IoSunny  
    {...props} 
    style={{ 
      display: "inline-block",
      verticalAlign: "middle",
      ...props.style
    }}
    size={props.size || 24}
  />;
}