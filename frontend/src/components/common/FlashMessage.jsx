
import "./FlashMessage.css";

export default function FlashMessage({ type = "success", message, onClose }) {
    if (!message) return null;

    return (
        <div className={`flash-message ${type}`} role="alert">
            <span>{message}</span>

            <button
                type="button"
                className="flash-close"
                onClick={onClose}
                aria-label="Close message"
            >
                &times;
            </button>
        </div>
    );
}
