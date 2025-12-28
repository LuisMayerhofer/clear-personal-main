############################################
### Generate Predictions for Training Data
############################################
# This script generates probability predictions for the German credit training data
# and saves an extended version with predictions included

# Set working directory to src folder
current_dir <- getwd()
# Attach the src folder to the path
setwd(paste0(current_dir, "/src"))

#--- Setup ----
library("counterfactuals")
library("mlr")
library("mlrCPO")
library("iml")

# Helper function for visible logging
log_message <- function(message, data = NULL) {
    cat("\n", rep("=", 80), "\n", sep = "")
    cat(format(Sys.time(), "%Y-%m-%d %H:%M:%S"), " - ", message, "\n")
    if (!is.null(data)) {
        cat("Data:\n")
        print(data)
    }
    cat(rep("=", 80), "\n\n", sep = "")
}

###---- Load data and model ----
log_message("Loading training data and model")

# Read the training data
credit = read.csv(
    "../src/r-server/data/german_credit_data.csv",
    row.names = 1,
    stringsAsFactors = TRUE
)

# Preprocess the data (same as in main script)
credit = na.omit(credit)
levels(credit$Purpose) = c(
    "others",
    "car",
    "others",
    "others",
    "furniture",
    "radio/TV",
    "others",
    "others"
)
levels(credit$Saving.accounts) = c("little", "moderate", "rich", "rich")
names(credit) = tolower(names(credit))
credit = droplevels.data.frame(credit)

# Load the trained model
credit.model = readRDS("../src/r-server/models/model_svm.rds")

###---- Generate predictions ----
log_message("Generating predictions for training data")

# Create predictor
pred = Predictor$new(model = credit.model, data = credit, class = "good")

# Generate predictions for all training data
training_predictions <- pred$predict(credit)
log_message("Predictions generated", head(training_predictions))

# Create extended dataset with predictions
credit_extended <- credit
credit_extended$pred <- training_predictions$good

# Add summary statistics
log_message("Summary of predictions")
cat("Mean probability:", round(mean(training_predictions$good), 4), "\n")
cat("Min probability:", round(min(training_predictions$good), 4), "\n")
cat("Max probability:", round(max(training_predictions$good), 4), "\n")
cat(
    "Predictions > 0.5 (good risk):",
    sum(training_predictions$good > 0.5),
    "\n"
)
cat(
    "Predictions <= 0.5 (bad risk):",
    sum(training_predictions$good <= 0.5),
    "\n"
)
cat("Actual good risk:", sum(credit$risk == "good"), "\n")
cat("Actual bad risk:", sum(credit$risk == "bad"), "\n")

###---- Save extended data ----
log_message("Saving extended training data")

# Save extended training data with predictions
output_file <- "../src/r-server/data/german_credit_data_with_predictions.csv"
write.csv(
    credit_extended,
    output_file,
    row.names = TRUE
)

log_message(paste("Extended training data saved to:", output_file))
log_message("Script completed successfully")
