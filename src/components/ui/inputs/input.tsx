interface Props {
  id: string;
  name: string;
  type: string;
  required: boolean;
  // className?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({
  id,
  name,
  type = "text",
  required = false,
  // className,
  placeholder,
  value,
  onChange,
}: Props) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default Input;
