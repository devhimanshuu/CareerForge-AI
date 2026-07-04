import React from "react";

export const SelectField = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="h-10 rounded-md border bg-background px-3 text-xs font-bold capitalize"
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {option.replaceAll("_", " ")}
      </option>
    ))}
  </select>
);
