export default function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select {...props} className={`input ${props.className ?? ''}`}>
        {props.children}
        </select>
    );
}
