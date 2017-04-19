"""redesign dash-slice-db-log

Revision ID: c377b998ae19
Revises: 844b75f5aa4f
Create Date: 2017-04-19 16:49:09.704836

"""

# revision identifiers, used by Alembic.
revision = 'c377b998ae19'
down_revision = '844b75f5aa4f'

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('dashboards', sa.Column('online', sa.Boolean(), nullable=True))
    op.add_column('logs', sa.Column('action_type', sa.String(length=200), nullable=True))
    op.add_column('logs', sa.Column('obj_id', sa.Integer(), nullable=True))
    op.add_column('logs', sa.Column('obj_type', sa.String(length=50), nullable=True))
    op.drop_column('logs', 'slice_id')
    op.drop_column('logs', 'dashboard_id')
    op.add_column('slices', sa.Column('database_id', sa.Integer(), nullable=True))
    op.add_column('slices', sa.Column('full_table_name', sa.String(length=2000), nullable=True))
    op.add_column('slices', sa.Column('online', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('slices', 'online')
    op.drop_column('slices', 'full_table_name')
    op.drop_column('slices', 'database_id')
    op.add_column('logs', sa.Column('dashboard_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True))
    op.add_column('logs', sa.Column('slice_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True))
    op.drop_column('logs', 'obj_type')
    op.drop_column('logs', 'obj_id')
    op.drop_column('logs', 'action_type')
    op.drop_column('dashboards', 'online')
    # ### end Alembic commands ###
