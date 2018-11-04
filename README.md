# article-scraper
app using node, mongodb, cheerio, mongoose


This app will scrape the charlotte observer for recent articles.

user will begin by clicking on the red scrape button. this will load the articles into the database

user will then click Get Articles Now button in the top left corner. this will display all articles

user can then;
    - click the link to view the entire article from the source

    - click to save the article to a favorites collection
        - to view the saved articles, click the My Saved Articles button in the top right
    
    - click to add a note to the specific article
        - user can type a title and note for each article.
            - save note will add the comments to the Note collection for that article
            - delete note will remove the comments from the Note collection

    - Delete Database in the footer will delete all documents in the Articles and Notes Collections
    