interface Props {
  id: string;
  name: string;
  required?: boolean;
  // className?: string;
  placeholder?: string;
  value: string;
  onChange: (s: string) => void;
  onEnter: () => void;
}

const PlainText = ({
  id,
  name,
  required = false,
  placeholder,
  value,
  onChange,
  onEnter,
}: Props) => {
  return (
    <textarea
      id={id}
      name={name}
      required={required}
      className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 hover:border-gray-300 resize-none min-h-[80px]"
      placeholder={placeholder}
      value={value}
      rows={3}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (!e.ctrlKey) {
            onEnter?.();
          } else {
            onChange(`${value}\n`);
          }
        }
      }}
    />
  );
};

export default PlainText;
