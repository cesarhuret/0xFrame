import { FaCircle } from "react-icons/fa";

export default function CircleIcon(props: any) {
  return <FaCircle 
    {...props} 
    style={{ 
      display: "inline-block",
      verticalAlign: "middle",
      ...props.style
    }}
    size={props.size || 24}
  />;
}