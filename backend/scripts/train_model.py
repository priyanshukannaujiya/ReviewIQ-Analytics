import os
import sys
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def parse_amazon_reviews(filepath, max_records=100000):
    """Parses the block-based Amazon review format."""
    records = []
    current_record = {}
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            line = line.strip()
            if not line:
                if current_record and 'review/score' in current_record and 'review/text' in current_record:
                    records.append(current_record)
                    if len(records) >= max_records:
                        break
                current_record = {}
                continue
            
            if ':' in line:
                key, val = line.split(':', 1)
                current_record[key.strip()] = val.strip()
    
    # Catch the last record if there's no trailing newline
    if current_record and 'review/score' in current_record and 'review/text' in current_record:
        if len(records) < max_records:
            records.append(current_record)
            
    df = pd.DataFrame(records)
    
    # Extract only what we need
    if not df.empty:
        df['score'] = pd.to_numeric(df['review/score'], errors='coerce')
        df['text'] = df['review/summary'].fillna('') + " " + df['review/text'].fillna('')
        df = df.dropna(subset=['score', 'text'])
        
        # Map score to sentiment
        def map_sentiment(score):
            if score >= 4.0:
                return 'Positive'
            elif score <= 2.0:
                return 'Negative'
            else:
                return 'Neutral'
                
        df['sentiment'] = df['score'].apply(map_sentiment)
        return df[['text', 'sentiment']]
    return pd.DataFrame()

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(root_dir, 'Beauty.txt')
    ml_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app', 'ml')
    
    if not os.path.exists(data_path):
        logging.error(f"Dataset not found at {data_path}")
        sys.exit(1)
        
    os.makedirs(ml_dir, exist_ok=True)
    
    logging.info(f"Parsing up to 100,000 records from {data_path}...")
    df = parse_amazon_reviews(data_path, max_records=100000)
    
    if df.empty:
        logging.error("No data parsed. Check the file format.")
        sys.exit(1)
        
    logging.info(f"Parsed {len(df)} records. Class distribution:\n{df['sentiment'].value_counts()}")
    
    logging.info("Training TF-IDF Logistic Regression model...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=10000, stop_words='english', ngram_range=(1, 2))),
        ('clf', LogisticRegression(max_iter=1000, class_weight='balanced', n_jobs=-1))
    ])
    
    pipeline.fit(df['text'], df['sentiment'])
    
    # Evaluate on training data (just for sanity check)
    accuracy = pipeline.score(df['text'], df['sentiment'])
    logging.info(f"Training accuracy: {accuracy:.4f}")
    
    model_path = os.path.join(ml_dir, 'sentiment_pipeline.joblib')
    logging.info(f"Saving model pipeline to {model_path}...")
    joblib.dump(pipeline, model_path)
    
    logging.info("Model training complete.")

if __name__ == '__main__':
    main()
