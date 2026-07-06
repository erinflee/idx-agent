"""mysql connection for the python side -> db.ts is the typescript version

reads creds from .env and hands back two ways into database:

    from db import engine          # sqlalchemy -> pandas.read_sql etc
    from db import get_connection  # raw mysql.connector cursor

password stays raw -> it's only url-encoded in-memory for the sqlalchemy
url, and .env is never touched
"""

import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine

# pull .env into os.environ -> no-op if the shell already set them
load_dotenv()

# creds straight from .env
MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
MYSQL_USER = os.environ.get("MYSQL_USER", "root")
MYSQL_PASSWORD = os.environ["MYSQL_PASSWORD"]          # raw -> may contain @ and other url-breaking chars
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "idx_exchange")

# sqlalchemy wants the password url-safe -> quote_plus turns @ into %40
# (only place we encode; the raw password above is what the connector uses)
_safe_password = quote_plus(MYSQL_PASSWORD)
DATABASE_URL = (
    f"mysql+mysqlconnector://{MYSQL_USER}:{_safe_password}"
    f"@{MYSQL_HOST}/{MYSQL_DATABASE}"
)

# pre_ping tests a connection before handing it out -> dodges "server has gone away" on idle
engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def get_connection():
    """raw mysql.connector connection -> takes the plain password, not the
    url-encoded one. caller is responsible for closing it.
    """
    import mysql.connector

    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
    )


if __name__ == "__main__":
    # sanity check -> python3 db.py prints the two table counts
    from sqlalchemy import text

    with engine.connect() as c:
        rets = c.execute(text("SELECT COUNT(*) FROM rets_property")).scalar()
        sold = c.execute(text("SELECT COUNT(*) FROM california_sold")).scalar()
    print(f"Connected to {MYSQL_DATABASE} OK")
    print(f"  rets_property:  {rets:,} rows")
    print(f"  california_sold:{sold:,} rows")
