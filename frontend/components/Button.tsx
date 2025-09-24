export default function Button({children, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button {...props} className={`btn ${props.className ?? ''}`}>{children}</button>;
}
