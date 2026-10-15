type IconProps = React.HTMLAttributes<SVGElement>;

export const SvgIcons = {
  calendarPlus: (props: IconProps) => (
    <svg
      role="img"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M12 13v5M9.5 15.5h5" />
    </svg>
  ),
};