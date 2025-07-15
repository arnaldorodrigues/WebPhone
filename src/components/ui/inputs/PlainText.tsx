type Props = {
  id: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  rows?: number;
  maxRows?: number;
  onChange: (s: string) => void;
  onEnter: () => void;
}

export const PlainText: React.FC<Props> = ({
  id,
  name,
  required = false,
  placeholder,
  value,
  rows = 1,
  maxRows = 3,
  onChange,
  onEnter,
}) => {
  return (
    <textarea
      id={id}
      name={name}
      required={required}
      className="appearance-none block w-full px-4 py-2.5 outline-none ring-2 border-1 ring-indigo-400 border-indigo-400 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 hover:outline-none hover:ring-2 hover:ring-indigo-500 hover:border-indigo-500 resize-none min-h-[40px]"
      placeholder={placeholder}
      value={value}
      rows={Math.min(
        Math.max((value.match(/\n/g) || []).length + 1, rows),
        maxRows
      )}
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
