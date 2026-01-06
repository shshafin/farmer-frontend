import React from "react";
import { NavLink } from "react-router-dom";

export default function CompanyHeader({ name }) {
  const companyName = name || "কোম্পানী নাম পাওয়া যায়নি";

  return (
    <div className="com-header-back">
      <div className="com-mainback">
        <div className="com-backlink">
          <NavLink
            to="/companyes"
            title="কোম্পানীসমূহতে ফিরে যান"
            className="flex items-center text-blue-600 hover:underline">
            <span className="mr-1">⇦</span>
          </NavLink>
        </div>

        <div className="company-header text-center mt-2">
          <h4 className="text-xl font-semibold">{companyName}</h4>
          <span className="co4by8h"></span>
        </div>
      </div>
    </div>
  );
}
