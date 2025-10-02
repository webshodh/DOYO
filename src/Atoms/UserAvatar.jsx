import { memo, useCallback } from "react";

// User avatar component
const UserAvatar = memo(({ user, size = "md" }) => {
  const getUserInitials = useCallback(() => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "A";
  }, [user]);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-9 h-9 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg relative`}
    >
      {getUserInitials()}
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
    </div>
  );
});
UserAvatar.displayName = "UserAvatar";
export default UserAvatar;
