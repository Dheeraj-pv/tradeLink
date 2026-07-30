function extractErrorCode(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (typeof error !== "object" || error === null) {
    return "";
  }

  const value = error as Record<string, unknown>;

  if (typeof value.code === "string" && value.code) {
    return value.code;
  }

  if (typeof value.error === "string" && value.error) {
    return value.error;
  }

  if (value.data && typeof value.data === "object") {
    return extractErrorCode(value.data);
  }

  if (value.response && typeof value.response === "object") {
    return extractErrorCode(value.response);
  }

  return "";
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  const code = extractErrorCode(error);

  switch (code) {
    case "E1001":
      return "Please review the information you entered and try again.";
    case "E1002":
      return "The request was invalid. Please refresh and try again.";
    case "E2001":
      return "The email or password you entered is incorrect.";
    case "E2002":
      return "Your session has expired. Please sign in again.";
    case "E2003":
      return "The link or token has expired. Please try again.";
    case "E2004":
      return "Two-factor verification is required to continue.";
    case "E2005":
      return "The current password you entered is incorrect.";
    case "E2006":
      return "The verification code is invalid or expired.";
    case "E2007":
      return "The password reset link is invalid or has already been used.";
    case "E3001":
      return "You don’t have permission to perform this action.";
    case "E4001":
      return "We couldn’t find that user.";
    case "E4002":
      return "We couldn’t find that job.";
    case "E5001":
      return "An account with that email already exists.";
    case "E5002":
      return "That bid has already been submitted.";
    case "E5003":
      return "A review for this job already exists.";
    case "E5004":
      return "That certification could not be found.";
    case "E9001":
    default:
      return "Something went wrong. Please try again in a moment.";
  }
}
