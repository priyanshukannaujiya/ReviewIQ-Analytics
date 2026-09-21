import os
import joblib
import logging

class ReviewAnalyzerService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        ml_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml')
        model_path = os.path.join(ml_dir, 'sentiment_pipeline.joblib')
        
        try:
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                logging.info(f"Successfully loaded ML model from {model_path}")
            else:
                logging.warning(f"ML model not found at {model_path}. Using fallback rule-based analysis.")
        except Exception as e:
            logging.error(f"Failed to load ML model: {e}")

    def analyze(self, text: str, fallback_rating: int = 5):
        if self.model is not None and text.strip():
            try:
                # Predict sentiment
                sentiment = self.model.predict([text])[0]
                
                # Get prediction probabilities for confidence
                probas = self.model.predict_proba([text])[0]
                confidence = max(probas)
                
                return {
                    "sentiment": sentiment,
                    "confidence": float(confidence)
                }
            except Exception as e:
                logging.error(f"Error during ML prediction: {e}")
        
        # Fallback to rule-based if model is missing or fails
        if fallback_rating >= 4:
            sentiment = "Positive"
        elif fallback_rating == 3:
            sentiment = "Neutral"
        else:
            sentiment = "Negative"
            
        return {
            "sentiment": sentiment,
            "confidence": 0.8
        }

review_analyzer = ReviewAnalyzerService()
