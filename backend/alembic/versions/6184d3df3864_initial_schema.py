"""Initial schema

Revision ID: 6184d3df3864
Revises: 
Create Date: 2026-09-21 19:01:07.976207

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6184d3df3864'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'organizations' not in tables:
        op.create_table('organizations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_organizations_id'), 'organizations', ['id'], unique=False)
    if 'uploaded_files' not in tables:
        op.create_table('uploaded_files',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('total_rows', sa.Integer(), nullable=False),
        sa.Column('valid_rows', sa.Integer(), nullable=False),
        sa.Column('invalid_rows', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_uploaded_files_id'), 'uploaded_files', ['id'], unique=False)
        op.create_index(op.f('ix_uploaded_files_organization_id'), 'uploaded_files', ['organization_id'], unique=False)
    if 'users' not in tables:
        op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    if 'organization_members' not in tables:
        op.create_table('organization_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_organization_members_id'), 'organization_members', ['id'], unique=False)
        op.create_index(op.f('ix_organization_members_organization_id'), 'organization_members', ['organization_id'], unique=False)
        op.create_index(op.f('ix_organization_members_user_id'), 'organization_members', ['user_id'], unique=False)
    if 'products' not in tables:
        op.create_table('products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('external_product_id', sa.String(length=255), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)
        op.create_index(op.f('ix_products_organization_id'), 'products', ['organization_id'], unique=False)
    if 'reviews' not in tables:
        op.create_table('reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('customer_name', sa.String(length=255), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('review_title', sa.String(length=255), nullable=True),
        sa.Column('review_text', sa.String(), nullable=False),
        sa.Column('review_date', sa.DateTime(), nullable=True),
        sa.Column('sentiment', sa.String(length=50), nullable=True),
        sa.Column('sentiment_confidence', sa.Float(), nullable=True),
        sa.Column('complaint_category', sa.String(length=100), nullable=True),
        sa.Column('category_confidence', sa.Float(), nullable=True),
        sa.Column('priority', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)
        op.create_index(op.f('ix_reviews_organization_id'), 'reviews', ['organization_id'], unique=False)
        op.create_index(op.f('ix_reviews_product_id'), 'reviews', ['product_id'], unique=False)
    if 'aspects' not in tables:
        op.create_table('aspects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('review_id', sa.Integer(), nullable=False),
        sa.Column('aspect_name', sa.String(length=255), nullable=False),
        sa.Column('sentiment', sa.String(length=50), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['review_id'], ['reviews.id'], ),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_aspects_id'), 'aspects', ['id'], unique=False)
        op.create_index(op.f('ix_aspects_review_id'), 'aspects', ['review_id'], unique=False)
    if 'complaints' not in tables:
        op.create_table('complaints',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('review_id', sa.Integer(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('priority', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('assigned_to', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['review_id'], ['reviews.id'], ),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_complaints_id'), 'complaints', ['id'], unique=False)
        op.create_index(op.f('ix_complaints_organization_id'), 'complaints', ['organization_id'], unique=False)
        op.create_index(op.f('ix_complaints_review_id'), 'complaints', ['review_id'], unique=False)
    if 'complaint_status_history' not in tables:
        op.create_table('complaint_status_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('complaint_id', sa.Integer(), nullable=False),
        sa.Column('old_status', sa.String(length=50), nullable=True),
        sa.Column('new_status', sa.String(length=50), nullable=False),
        sa.Column('changed_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['complaint_id'], ['complaints.id'], ),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_complaint_status_history_complaint_id'), 'complaint_status_history', ['complaint_id'], unique=False)
        op.create_index(op.f('ix_complaint_status_history_id'), 'complaint_status_history', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
        op.drop_index(op.f('ix_complaint_status_history_id'), table_name='complaint_status_history')
        op.drop_index(op.f('ix_complaint_status_history_complaint_id'), table_name='complaint_status_history')
        op.drop_table('complaint_status_history')
        op.drop_index(op.f('ix_complaints_review_id'), table_name='complaints')
        op.drop_index(op.f('ix_complaints_organization_id'), table_name='complaints')
        op.drop_index(op.f('ix_complaints_id'), table_name='complaints')
        op.drop_table('complaints')
        op.drop_index(op.f('ix_aspects_review_id'), table_name='aspects')
        op.drop_index(op.f('ix_aspects_id'), table_name='aspects')
        op.drop_table('aspects')
        op.drop_index(op.f('ix_reviews_product_id'), table_name='reviews')
        op.drop_index(op.f('ix_reviews_organization_id'), table_name='reviews')
        op.drop_index(op.f('ix_reviews_id'), table_name='reviews')
        op.drop_table('reviews')
        op.drop_index(op.f('ix_products_organization_id'), table_name='products')
        op.drop_index(op.f('ix_products_id'), table_name='products')
        op.drop_table('products')
        op.drop_index(op.f('ix_organization_members_user_id'), table_name='organization_members')
        op.drop_index(op.f('ix_organization_members_organization_id'), table_name='organization_members')
        op.drop_index(op.f('ix_organization_members_id'), table_name='organization_members')
        op.drop_table('organization_members')
        op.drop_index(op.f('ix_users_id'), table_name='users')
        op.drop_index(op.f('ix_users_email'), table_name='users')
        op.drop_table('users')
        op.drop_index(op.f('ix_uploaded_files_organization_id'), table_name='uploaded_files')
        op.drop_index(op.f('ix_uploaded_files_id'), table_name='uploaded_files')
        op.drop_table('uploaded_files')
        op.drop_index(op.f('ix_organizations_id'), table_name='organizations')
        op.drop_table('organizations')
    # ### end Alembic commands ###
