import { toast } from "sonner";

interface ToastProps {
  title: string;
  id: string | number;
  description: string;
  status: "success" | "error" | "info" | "warning";
}

const Toast = ({ title, description, status }: ToastProps) => {
  let styles = {};

  switch (status) {
    case "success":
      styles = {
        color: "#1F7A1F",
        borderColor: "#52C41A",
        backgroundColor: "#F6FFED",
      };
      break;

    case "warning":
      styles = {
        color: "#874D00",
        borderColor: "#FAAD14",
        backgroundColor: "#FFFBE6",
      };
      break;

    case "info":
      styles = {
        color: "#0C3C78",
        borderColor: "#1677FF",
        backgroundColor: "#E6F4FF",
      };
      break;

    case "error":
      styles = {
        color: "#A8071A",
        borderColor: "#FF4D4F",
        backgroundColor: "#FFF2F0",
      };
      break;

    default:
      styles = {};
      break;
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "16px",
        display: "flex",
        maxWidth: "364px",
        borderRadius: "8px",
        alignItems: "center",
        backgroundColor: "#fff",
        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
        outline: "1px solid rgba(0, 0, 0, 0.05)",
        ...styles,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="w-100">
          <p
            style={{
              fontSize: "16px",
              fontWeight: 500,
              color: "#111827",
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: "16px",
              color: "#6B7280",
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export const customToast = (props: Omit<ToastProps, "id">) => {
  return toast.custom((id) => (
    <Toast
      id={id}
      title={props.title}
      status={props.status}
      description={props.description}
    />
  ));
};
