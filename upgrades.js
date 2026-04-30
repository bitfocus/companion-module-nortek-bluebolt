module.exports = [
  function v2_1_0(context, props) {
    let changes = {
      updatedConfig: null,
      updatedSecrets: null,
      updatedActions: [],
      updatedFeedbacks: [],
    };

    const getOptionValue = (option) => {
      if (option && typeof option === "object" && "value" in option) {
        return option.value;
      }

      return option;
    };

    const setOptionValue = (option, value) => {
      if (option && typeof option === "object" && "value" in option) {
        option.value = value;
        return option;
      }

      return value;
    };

    for (const feedback of props.feedbacks) {
      if (feedback.feedbackId === "bank1") {
        feedback.feedbackId = "powerStatus";
        feedback.options.bank = setOptionValue(feedback.options.bank, 1);
        changes.updatedFeedbacks.push(feedback);
      } else if (feedback.feedbackId === "bank2") {
        feedback.feedbackId = "powerStatus";
        feedback.options.bank = setOptionValue(feedback.options.bank, 2);
        changes.updatedFeedbacks.push(feedback);
      } else if (feedback.feedbackId === "bank3") {
        feedback.feedbackId = "powerStatus";
        feedback.options.bank = setOptionValue(feedback.options.bank, 3);
        changes.updatedFeedbacks.push(feedback);
      } else if (
        feedback.feedbackId === "powerStatus" &&
        feedback.options &&
        feedback.options.bank !== undefined
      ) {
        const bankValue = Number(getOptionValue(feedback.options.bank));
        if (Number.isFinite(bankValue)) {
          feedback.options.bank = setOptionValue(
            feedback.options.bank,
            bankValue,
          );
          changes.updatedFeedbacks.push(feedback);
        }
      }
    }

    return changes;
  },
];
