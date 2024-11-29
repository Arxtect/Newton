import { useGitRepo } from "store";
import { toast } from "react-toastify";

export const useCommitAndPush = () => {
  const { commitAll, pushCurrentBranchToOrigin } = useGitRepo((state) => ({
    commitAll: state.commitAll,
    pushCurrentBranchToOrigin: state.pushCurrentBranchToOrigin,
  }));

  const commitAndPush = async (message = "Automated commit") => {
    try {
      await commitAll({ message });
      await pushCurrentBranchToOrigin(false);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return commitAndPush;
};
