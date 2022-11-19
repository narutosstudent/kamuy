export function Spinner(props: { class?: string; label: string }) {
  return (
    <div
      className={`spinner ${props.class}`}
      role="alert"
      aria-label={props.label}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path
          fill="#444"
          d="m9.9.2-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z"
        />
      </svg>
    </div>
  )
}
