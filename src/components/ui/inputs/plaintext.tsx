interface Props {
  id: string;
  name: string;
  required?: boolean;
  // className?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200 resize-none"
      placeholder={placeholder}
      value={value}
      rows={3}
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (!e.ctrlKey) {
            e.preventDefault();
            onEnter?.();
          } else {
            e.currentTarget.value += "\n";
          }
        }
      }}
    />
  );
};

export default PlainText;
