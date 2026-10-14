"""Database schema introspection and automatic missing-column reconciliation."""

import logging
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.sql.schema import MetaData

logger = logging.getLogger("sahay.database")


def reconcile_database_schema(target_engine: Engine, metadata: MetaData) -> dict:
    """Inspect existing database tables and safely add any missing columns defined in SQLAlchemy models.
    
    This guarantees that new model columns are automatically synchronized without destructive table drops.
    """
    results = {"tables_inspected": 0, "columns_added": []}
    inspector = inspect(target_engine)
    existing_tables = set(inspector.get_table_names())

    with target_engine.connect() as conn:
        for table_name, table in metadata.tables.items():
            if table_name not in existing_tables:
                continue

            results["tables_inspected"] += 1
            existing_cols = {col["name"] for col in inspector.get_columns(table_name)}

            for col in table.columns:
                if col.name not in existing_cols:
                    col_type = str(col.type).upper()
                    # Determine safe fallback SQL type and default value
                    if "INT" in col_type:
                        sql_type = "INTEGER DEFAULT 0"
                    elif "FLOAT" in col_type or "NUMERIC" in col_type or "REAL" in col_type:
                        sql_type = "REAL DEFAULT 0.0"
                    elif "BOOL" in col_type:
                        sql_type = "BOOLEAN DEFAULT 0"
                    elif "DATE" in col_type or "TIME" in col_type:
                        sql_type = "DATETIME NULL"
                    elif "CHAR" in col_type or "STRING" in col_type:
                        length = getattr(col.type, "length", 255) or 255
                        sql_type = f"VARCHAR({length}) DEFAULT ''"
                    elif "TEXT" in col_type:
                        sql_type = "TEXT DEFAULT ''"
                    else:
                        sql_type = "TEXT DEFAULT ''"

                    alter_stmt = text(f"ALTER TABLE {table_name} ADD COLUMN {col.name} {sql_type}")
                    try:
                        conn.execute(alter_stmt)
                        conn.commit()
                        logger.info("Schema Reconciliation: Added missing column %s.%s (%s)", table_name, col.name, sql_type)
                        results["columns_added"].append(f"{table_name}.{col.name}")
                    except Exception as exc:
                        logger.warning("Schema Reconciliation notice on %s.%s: %s", table_name, col.name, exc)

    return results
