import React from "react";
import { useTranslation } from "react-i18next";

const AlertComponent = ({ alertMessage }) => {
  const { t } = useTranslation();

  return (
    <div className="alert">
      {/* Dynamically translated message */}
      <p>{t(alertMessage)}</p>
    </div>
  );
};

export default AlertComponent;
