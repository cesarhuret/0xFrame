import { AiOutlineCaretDown } from "react-icons/ai";

export default function CaretDownIcon(props: any) {
  return <AiOutlineCaretDown 
    {...props} 
    style={{ 
      display: "inline-block",
      verticalAlign: "middle",
      ...props.style
    }}
    size={props.size || 24}
  />;
}