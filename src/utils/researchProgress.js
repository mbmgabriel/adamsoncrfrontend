export const buildReviewProgress = (steps, assignedUrb = [], completed = false) => {
  const positions = new Map(assignedUrb.map((member, index) => [String(member.user_id), index]));
  const order = (step) => {
    if (step.isDirector) return Number.MAX_SAFE_INTEGER;
    if (step.isUrb) return 5 + (positions.get(String(step.id)) ?? assignedUrb.length);
    const role = step.role.toLowerCase();
    if (role.includes('coordinator')) return 1;
    if (role.includes('chairperson') || role.includes('department chair')) return 2;
    if (role.includes('dean')) return 3;
    if (role.includes('staff')) return 4;
    return 5;
  };
  return steps.map((step) => {
    const isDirector = step.role.toLowerCase().includes('director');
    const position = positions.get(String(step.id));
    return {
      ...step, isDirector,
      role: step.isUrb && position !== undefined ? `URB ${position + 1}` : step.role,
      endorsed: isDirector ? completed : step.endorsed,
    };
  }).sort((a, b) => order(a) - order(b));
};


export const getReviewStepLabel = (step) => {
  if (step.isDirector) return step.endorsed ? 'Completed' : 'Pending completion';
  if (step.endorsed) return step.isUrb ? 'Approved' : 'Endorsed';
  return step.revisionRequired ? 'Revision required' : 'Pending';
};
