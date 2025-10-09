module.exports = [
  function v2_1_0(context, props) {
    let changes = {
      updatedConfig: null,
      updatedActions: [],
      updatedFeedbacks: [],
    };
    for (const feedback of props.feedbacks) {
      if (feedback.feedbackId === "bank1") {
        feedback.feedbackId = "powerStatus";
        feedback.options.bank = 1;
        changes.updatedFeedbacks.push(feedback);
      } else if (feedback.feedbackId === "bank2") {
        feedback.feedbackId = "powerStatus";
        feedback.options.bank = 2;
        changes.updatedFeedbacks.push(feedback);
      } else if (feedback.feedbackId === "bank3") {
        feedback.feedbackId = "powerStatus";
        feedback.options.bank = 3;
        changes.updatedFeedbacks.push(feedback);
      }
    }

    return changes;
  },
];
