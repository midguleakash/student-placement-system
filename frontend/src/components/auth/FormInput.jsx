function FormInput({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    required = true
}) {
    return (
        <div className="form-group">

            <label htmlFor={name}>
                {label}
            </label>

            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
            />

        </div>
    );
}

export default FormInput;