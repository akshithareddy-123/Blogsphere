import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => {
  try {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (e) {
    return '';
  }
};

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  try {
    if (!date) return '';
    return format(new Date(date), formatStr);
  } catch (e) {
    return '';
  }
};
