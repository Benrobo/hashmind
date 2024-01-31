import { FlexColStart } from "./flex";

type Props = {
  children?: React.ReactNode;
  message?: string;
};

export default function Tooltip({ children, message }: Props) {
  return (
    <FlexColStart className="w-fit relative group">
      {children}
      <span className="absolute top-10 font-ppReg opacity-0 m-4 mx-auto scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 z-[100]">
        {message}
      </span>
    </FlexColStart>
  );
}
